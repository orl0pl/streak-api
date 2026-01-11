import { error, json, Router } from 'itty-router';
import { apiDocs } from './docs';
import { fetchUserData, randomUserAgent, simplifyUserData } from './services';

const router = Router();

router.get('/', async (req) => {
	return new Response(apiDocs);
});

router.get('/user/:name', async (req)=>{
	console.log(req.params.name)
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
	console.log(req.params.name)
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

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return router.fetch(request);
	},
} satisfies ExportedHandler<Env>;
