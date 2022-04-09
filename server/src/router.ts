import { Router } from "express";
import station_list from "./endpoints/station_list";

const routes = Router();

routes.get("/stations", station_list.fetchStationList);

export default routes;