import { SimplifiedDuolingoAPIResponse, SimplifiedDuolingoAPIUser, ThirdPartyResponse } from "./models"

export function randomUserAgent(){
    let userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3", 
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
    ]
    return userAgents[Math.floor(Math.random()*userAgents.length)]
}

export async function fetchUserData(username: string): Promise<ThirdPartyResponse<SimplifiedDuolingoAPIResponse>>{
    let url = "https://www.duolingo.com/2017-06-30/users?username=" + username
    let headers = {"User-Agent": randomUserAgent()}
    let response = await fetch(url, {headers})
    if (response.status === 200) {
        
        return {error: undefined, data: (await response.json() )as SimplifiedDuolingoAPIResponse};
    }
    return {error: "Fetching Duolingo API was unsuccessful", data: undefined}
}

export function simplifyUserData(user_data: any): SimplifiedDuolingoAPIUser {
    let simplified_courses = [];
    for (let course of user_data.courses || []) {
        let simplified_course = {
            title: course.title || "",
            learningLanguage: course.learningLanguage || "",
            fromLanguage: course.fromLanguage || "",
            xp: course.xp || 0
        };
        simplified_courses.push(simplified_course);
    }
    
    let simplified_user: any = {
        streak: user_data.streak || 0,
        totalXp: user_data.totalXp || 0,
        courses: simplified_courses
    };
    
    let streak_data = {
        currentStreak: {
            startDate: user_data.streakData?.currentStreak?.startDate || "",
            length: user_data.streakData?.currentStreak?.length || 0,
            endDate: user_data.streakData?.currentStreak?.endDate || ""
        }
    };
    simplified_user.streakData = streak_data;
    
    return simplified_user;
}