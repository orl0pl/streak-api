export interface SuccessResponse<T> {
    data: T,
    error: undefined
}
export interface ErrorResponse {
    error: string,
    data: undefined
}
export type ThirdPartyResponse<T> = SuccessResponse<T>|ErrorResponse;  

export interface SimplifiedDuolingoAPIUser {
    streak: number,
    totalXp: number,
    streakData: {
        currentStreak: {
            startDate: string,
            length: number,
            endDate: string
        }
    }
    courses: {
        title: string,
        learningLanguage: string,
        fromLanguage: string,
        xp: number
    }[]
}

export interface SimplifiedDuolingoAPIResponse {
    users: SimplifiedDuolingoAPIUser[]
}