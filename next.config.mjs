/** @type {import('next').NextConfig} */
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
const nextConfig = {
    images: {
        domains: [
            'uploadthing.com',
            'utfs.io',
            'img.clerk.com',
            'subdomain',
            'files.stripe.com',
        ]
      },
      experimental: {
        serverActions: {
          allowedOrigins: [
            'localhost:3000',
            
            'fxzdb6pg-3000.asse.devtunnels.ms'
          ],
          allowedForwardedHosts: ['localhost'],
        }
      },
      
      webpack: (webpackConfig, { webpack }) => {
        webpackConfig.plugins.push(
          // Remove node: from import specifiers, because Next.js does not yet support node: scheme
          // https://github.com/vercel/next.js/issues/28774
          new webpack.NormalModuleReplacementPlugin(
            /^node:/,
            (resource) => {
              resource.request = resource.request.replace(/^node:/, '');
            },
          ),
        );
    
        return webpackConfig;
      },
      
};

export default nextConfig;
