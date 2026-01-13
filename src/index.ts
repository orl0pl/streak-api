import { error, json, Router } from 'itty-router';
import { apiDocs } from './docs';
import { fetchUserData, randomUserAgent, simplifyUserData } from './services';

export interface Env {
  RATE_LIMITER: DurableObjectNamespace<RateLimiter>;
}

import { DurableObject } from "cloudflare:workers";

// Durable Object
export class RateLimiter extends DurableObject {
	static milliseconds_per_request = 100;
	static milliseconds_for_grace_period = 5000;

	nextAllowedTime: number;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.nextAllowedTime = 0;
	}

	async getMillisecondsToNextRequest(): Promise<number> {
		const now = Date.now();

		this.nextAllowedTime = Math.max(now, this.nextAllowedTime);
		this.nextAllowedTime += RateLimiter.milliseconds_per_request;

		const value = Math.max(
			0,
			this.nextAllowedTime - now - RateLimiter.milliseconds_for_grace_period,
		);
		return value;
	}
}

const router = Router();

router.get('/', async (req) => {
	return new Response(apiDocs);
});

router.get('/user/:name', async (req)=>{
	let response = await fetchUserData(req.params.name)
	if (response.data){
		if (response.data.users.length > 0) {
			return json(simplifyUserData(response.data.users[0]))
		} else {
			return error(404, "User with username '" + req.params.name + "' not found")
		}
	} else {
		return error(500, response.error)
	}
})

router.get('/streak/:name', async (req)=>{
	let response = await fetchUserData(req.params.name)
	if (response.data){
		if (response.data.users.length > 0) {
			return json(response.data.users[0].streak)
		} else {
			return error(404, "User with username '" + req.params.name + "' not found")
		}
	} else {
		return error(500, response.error)
	}

})

router.get('*', async (req)=>{
	return error(404, 'Route not found')
})

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const ip = request.headers.get("CF-Connecting-IP");
		if (ip === null) {
			return error(400, 'Could not determine client IP used for rate limiting.');
		}

		try {
			const stub = env.RATE_LIMITER.getByName(ip);
			const milliseconds_to_next_request =
				await stub.getMillisecondsToNextRequest();
			if (milliseconds_to_next_request > 0) {
				// Alternatively one could sleep for the necessary length of time 
				return error(429, 'Rate limit exceeded');
			}
		} catch (err) {
			return error(502, 'Could not connect to rate limiter: '+err)
		}
		return router.fetch(request);
	},
} satisfies ExportedHandler<Env>;
