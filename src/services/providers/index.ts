import { isDemo } from '@/lib/config';

export const Providers = {
  audit: isDemo() 
    ? require("./mock/audit.mock").audit 
    : require("./real/audit").audit,
  
  discovery: isDemo() 
    ? require("./mock/discovery.mock").discovery 
    : require("./real/discovery").discovery,
  
  mediaPack: isDemo() 
    ? require("./mock/mediaPack.mock").mediaPack 
    : require("./real/mediaPack").mediaPack,
  
  email: isDemo() 
    ? require("./mock/email.mock").email 
    : require("./real/email").email
};
