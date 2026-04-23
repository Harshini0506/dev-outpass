import { prisma } from '../prisma/client';
import { Role } from '@prisma/client';

/**
 * Script to check and update the user role for 22071a0508@vnrvjiet.in
 */
async function updateUserRole() {
  try {
    const email = '22071a0508@vnrvjiet.in'; // lowercase as used by auth server
    
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Check current user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!existingUser) {
      console.log(`❌ User not found with email ${email}`);
      return;
    }
    
    console.log(`📋 Current user details:`, {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      createdAt: existingUser.createdAt
    });
    
    if (existingUser.role === Role.HOD) {
      console.log(`✅ User already has HOD role!`);
      return;
    }
    
    // Update user role to HOD
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: Role.HOD
      }
    });
    
    console.log(`✅ Successfully updated user role to HOD!`);
    console.log(`Updated user details:`, {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    });
    
    // Also check if there's a duplicate uppercase version
    const uppercaseUser = await prisma.user.findUnique({
      where: { email: '22071A0508@vnrvjiet.in' }
    });
    
    if (uppercaseUser) {
      console.log(`⚠️ Found duplicate uppercase user, deleting...`);
      await prisma.user.delete({
        where: { email: '22071A0508@vnrvjiet.in' }
      });
      console.log(`✅ Deleted duplicate uppercase user`);
    }
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  updateUserRole()
    .then(() => {
      console.log('🎉 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { updateUserRole };
