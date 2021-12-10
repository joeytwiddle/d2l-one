const nodeEnv = process.env.NODE_ENV || 'development';

const inProduction = nodeEnv === 'production';

//export const apiDomain = 'localhost';
export const apiDomain = inProduction ? 'd2l.sg' : '192.168.0.195';

//export const apiUrl = inProduction ? `https://${apiDomain}/graphql` : `http://${apiDomain}:4000/graphql`;

export const apiUrl = inProduction ? `//${apiDomain}/v1/graphql` : `//${apiDomain}:4000/graphql`;
