import { Router } from 'express';
import { AddressController } from './address.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

/**
 * @openapi
 * /users/address:
 *   post:
 *     summary: Add new shipping or billing address for current user
 *     tags:
 *       - User Address Book & Recent Views (Member 3)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - street
 *               - city
 *               - district
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "+8801712345678"
 *               street:
 *                 type: string
 *                 example: House 12, Road 5, Block B, Dhanmondi
 *               city:
 *                 type: string
 *                 example: Dhaka
 *               district:
 *                 type: string
 *                 example: Dhaka
 *               postalCode:
 *                 type: string
 *                 example: "1209"
 *               country:
 *                 type: string
 *                 example: Bangladesh
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *               type:
 *                 type: string
 *                 enum: [home, office, other]
 *                 example: home
 *     responses:
 *       201:
 *         description: Address added successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  AddressController.addAddress
);

/**
 * @openapi
 * /users/address:
 *   get:
 *     summary: Get all saved addresses of current user
 *     tags:
 *       - User Address Book & Recent Views (Member 3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  AddressController.getUserAddresses
);

/**
 * @openapi
 * /users/address/{addressId}:
 *   patch:
 *     summary: Update an address or set default status
 *     tags:
 *       - User Address Book & Recent Views (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the address
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *               street:
 *                 type: string
 *                 example: House 20, Road 8, Gulshan 1
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 */
router.patch(
  '/:addressId',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  AddressController.updateAddress
);

/**
 * @openapi
 * /users/address/{addressId}:
 *   delete:
 *     summary: Delete a saved address
 *     tags:
 *       - User Address Book & Recent Views (Member 3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the address
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.delete(
  '/:addressId',
  authMiddleware(),
  roleMiddleware('user', 'moderator', 'admin'),
  AddressController.deleteAddress
);

export const AddressRoutes = router;
