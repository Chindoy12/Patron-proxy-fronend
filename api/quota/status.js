import { GatewayRoutes } from '../../server/GatewayRoutes.js';
import { createVercelFunction } from '../../server/vercelFunction.js';

export default createVercelFunction(GatewayRoutes.QUOTA_STATUS);
