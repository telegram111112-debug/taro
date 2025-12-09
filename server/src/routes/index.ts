import { Router } from 'express'
import { authRoutes } from './auth.routes.js'
import { userRoutes } from './user.routes.js'
import { cardsRoutes } from './cards.routes.js'
import { readingsRoutes } from './readings.routes.js'
import { collectionRoutes } from './collection.routes.js'
import { giftsRoutes } from './gifts.routes.js'
import { achievementsRoutes } from './achievements.routes.js'
import referralsRoutes from './referrals.routes.js'
import { tarotRoutes } from './tarot.routes.js'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/user', userRoutes)
routes.use('/cards', cardsRoutes)
routes.use('/readings', readingsRoutes)
routes.use('/collection', collectionRoutes)
routes.use('/gifts', giftsRoutes)
routes.use('/achievements', achievementsRoutes)
routes.use('/referrals', referralsRoutes)
routes.use('/tarot', tarotRoutes)

export default routes
