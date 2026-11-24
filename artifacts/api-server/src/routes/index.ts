import { Router, type IRouter } from "express";
import healthRouter from "./health";
import staysRouter from "./stays";
import bookingsRouter from "./bookings";
import partnersRouter from "./partners";

const router: IRouter = Router();

router.use(healthRouter);
router.use(staysRouter);
router.use(bookingsRouter);
router.use(partnersRouter);

export default router;
