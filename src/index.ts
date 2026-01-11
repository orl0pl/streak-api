import { error, Router } from 'itty-router';
import { apiDocs } from './docs';
import { fetchUserData, simplifyUserData } from './services';

const router = Router();


router.get('/', async (req) => {
	return new Response(apiDocs);
});

router.get('/user/:name', async ({name})=>{
	let response = await fetchUserData(name)
	if (response.data){
		if (response.data.users.length > 0) {
			return JSON.stringify(simplifyUserData(response.data))
		} else {
			return error(404, JSON.stringify({error: "User with username '" + name + "' not found"}))
		}
	} else {
		return error(500, JSON.stringify({error: response.error}))
	}
})

router.get('/streak/:name', async ({name})=>{
	let response = await fetchUserData(name)
	if (response.data){
		if (response.data.users.length > 0) {
			return JSON.stringify(simplifyUserData(response.data).streak)
		} else {
			return error(404, JSON.stringify({error: "User with username '" + name + "' not found"}))
		}
	} else {
		return error(500, JSON.stringify({error: response.error}))
	}
})


export default {
	async fetch(request, env, ctx): Promise<Response> {
		return router.fetch(request);
	},
} satisfies ExportedHandler<Env>;
