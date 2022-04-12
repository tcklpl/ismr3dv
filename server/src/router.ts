import { Router } from "express";
import server_info from "./endpoints/server_info";
import station_list from "./endpoints/station_list";

const routes = Router();

routes.get("/api/stations/:startdate/:enddate", station_list.fetchStationList);
routes.get("/api/info", server_info.sendServerInfo);

export default routes;