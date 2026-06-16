import { httpRouter } from "convex/server";
import { auth } from "./auth";

// Convex Auth registers its sign-in / callback / token routes here.
const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
