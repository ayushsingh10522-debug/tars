export const signIn = async () => {
    const puter = (await import("@heyputer/puter.js")).default;
    return await puter.auth.signIn();
}

export const signOut = async () => {
    const puter = (await import("@heyputer/puter.js")).default;
    return puter.auth.signOut();
}

export const getCurrentUser = async () => {
    try {
        const puter = (await import("@heyputer/puter.js")).default;
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}