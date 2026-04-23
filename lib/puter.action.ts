import {getOrCreateHostingConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";

export const signIn = async () => {
    const puter = (await import("@heyputer/puter.js")).default;
    return await puter.auth.signIn();
}

export const signOut = async () => {
    const puter = (await import("@heyputer/puter.js")).default;
    return puter.auth.signOut();
}

export const getCurrentUser = async () => {
    const puter = (await import("@heyputer/puter.js")).default;
    try {
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

export const createProject = async ({ item }: CreateProjectParams):Promise<DesignItem | null | undefined> => {
   const projectId = item.id;

   const hosting = await getOrCreateHostingConfig();

   const hostedSource = projectId ?
       await uploadImageToHosting({ hosting, url: item.sourceImage, projectId, label: 'source', }) : null;

   const hostedRender = projectId && item.renderedImage ?
       await uploadImageToHosting({ hosting, url: item.renderedImage, projectId, label: 'rendered', }) : null;

   const resolvedResource = hostedSource ?.url || (isHostedUrl(item.sourceImage)
       ? item.sourceImage
       : ''
   );

   if(!resolvedResource) {
       console.warn('Failed to host source image, skipping save.')
       return null;
   }

   const resolvedRender = hostedRender ?. url
    ? hostedRender ?.url
    : item.renderedImage && isHostedUrl(item.renderedImage)
        ? item.renderedImage
        : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    }  = item;

    const payload = {
        ...rest,
        sourceImage: resolvedResource,
        renderedImage: resolvedRender,
    }

    try {
        //Call the Puter worker to store project in kv

        return payload;
    } catch (e) {
        console.log('error creating project', e);
        return null;
    }
}