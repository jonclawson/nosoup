import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })

  if (!existingAdmin) {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin'
      } as any
    })
    
    console.log('Admin user created: admin@example.com / admin123')
  } else {
    console.log('Admin user already exists')
  }

  // Check if regular user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'user@example.com' }
  })

  if (!existingUser) {
    // Create regular user
    const hashedPassword = await bcrypt.hash('user123', 10)
    
    await prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'Regular User',
        password: hashedPassword,
        role: 'user'
      } as any
    })
    
    console.log('Regular user created: user@example.com / user123')
  } else {
    console.log('Regular user already exists')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 