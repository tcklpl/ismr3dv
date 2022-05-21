import { Router } from "express";
import ipp from "./endpoints/ipp";
import server_info from "./endpoints/server_info";
import station_list from "./endpoints/station_list";

const routes = Router();

routes.get("/api/stations/:startdate/:enddate", station_list.fetchStationList);
routes.get("/api/ipp/:startdate/:enddate/:sat/:stations/:ion", ipp.fetchIPP);
routes.get("/api/info", server_info.sendServerInfo);

export default routes;