import {appServer} from "./webSupport/appServer";
import {configureApp} from "./appConfig";
import {environment} from "./environment";

appServer.start(Number(process.env.PORT || 8787), configureApp(environment.fromEnv()));
