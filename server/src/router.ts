import { Router } from "express";
import station_list from "./endpoints/station_list";

const routes = Router();

routes.get("/stations/:startdate/:enddate", station_list.fetchStationList);

export default routes;