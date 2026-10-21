import type {NextConfig} from 'next';
import path from 'node:path';
const config:NextConfig={
 webpack(config,{webpack}){config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/,path.resolve(process.cwd(),'lib/platform/cloudflare-unavailable.ts')));return config;},
};
export default config;
