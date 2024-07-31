import { CorsOptions } from "cors"

const whitelist = [process.env.FRONTEND_URL]
export const corsOptions : CorsOptions = {
  origin: function (origin, callback) {
    if(process.argv[2] === '--api'){
      whitelist.push(undefined)
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS! 🚨🚔'))
    }
  }
}