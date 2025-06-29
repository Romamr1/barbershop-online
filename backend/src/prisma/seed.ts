import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.bookingService.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.barberShop.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create super admin
  const superAdminPassword = await hashPassword('superadmin123');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@barbershop.com',
      passwordHash: superAdminPassword,
      name: 'Super Admin',
      role: 'superadmin',
    }
  });

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@barbershop.com',
      passwordHash: adminPassword,
      name: 'Barbershop Admin',
      role: 'admin',
    }
  });

  // Create barbershop
  const barbershop = await prisma.barberShop.create({
    data: {
      name: 'Elite Barbershop',
      address: '123 Main Street, Downtown',
      description: 'Premium barbershop offering top-quality haircuts and grooming services',
      type: 'premium',
      latitude: 40.7128,
      longitude: -74.0060,
      phone: '+1-555-0123',
      email: 'info@elitebarbershop.com',
      workingHours: JSON.stringify({
        monday: { isOpen: true, open: '09:00', close: '18:00' },
        tuesday: { isOpen: true, open: '09:00', close: '18:00' },
        wednesday: { isOpen: true, open: '09:00', close: '18:00' },
        thursday: { isOpen: true, open: '09:00', close: '18:00' },
        friday: { isOpen: true, open: '09:00', close: '18:00' },
        saturday: { isOpen: true, open: '10:00', close: '16:00' },
        sunday: { isOpen: false }
      }),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800'
      ]),
      rating: 4.8,
      reviewCount: 127,
    }
  });

  // Update admin to be associated with barbershop
  await prisma.user.update({
    where: { id: admin.id },
    data: { barberShopId: barbershop.id }
  });

  // Create barber users
  const barber1Password = await hashPassword('barber123');
  const barber1 = await prisma.user.create({
    data: {
      email: 'john@elitebarbershop.com',
      passwordHash: barber1Password,
      name: 'John Smith',
      role: 'barber',
      barberShopId: barbershop.id,
    }
  });

  const barber2Password = await hashPassword('barber123');
  const barber2 = await prisma.user.create({
    data: {
      email: 'mike@elitebarbershop.com',
      passwordHash: barber2Password,
      name: 'Mike Johnson',
      role: 'barber',
      barberShopId: barbershop.id,
    }
  });

  // Create barber profiles
  const barber1Profile = await prisma.barber.create({
    data: {
      userId: barber1.id,
      barberShopId: barbershop.id,
      bio: 'Experienced barber with 8 years of expertise in modern cuts and classic styles',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      specialties: JSON.stringify(['Fade Cuts', 'Beard Trimming', 'Classic Cuts']),
      workingHours: JSON.stringify({
        monday: { isOpen: true, open: '09:00', close: '18:00' },
        tuesday: { isOpen: true, open: '09:00', close: '18:00' },
        wednesday: { isOpen: true, open: '09:00', close: '18:00' },
        thursday: { isOpen: true, open: '09:00', close: '18:00' },
        friday: { isOpen: true, open: '09:00', close: '18:00' },
        saturday: { isOpen: true, open: '10:00', close: '16:00' },
        sunday: { isOpen: false }
      }),
    }
  });

  const barber2Profile = await prisma.barber.create({
    data: {
      userId: barber2.id,
      barberShopId: barbershop.id,
      bio: 'Specialist in contemporary styles and creative designs',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      specialties: JSON.stringify(['Creative Cuts', 'Color Services', 'Styling']),
      workingHours: JSON.stringify({
        monday: { isOpen: true, open: '10:00', close: '19:00' },
        tuesday: { isOpen: true, open: '10:00', close: '19:00' },
        wednesday: { isOpen: true, open: '10:00', close: '19:00' },
        thursday: { isOpen: true, open: '10:00', close: '19:00' },
        friday: { isOpen: true, open: '10:00', close: '19:00' },
        saturday: { isOpen: true, open: '10:00', close: '16:00' },
        sunday: { isOpen: false }
      }),
    }
  });

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Classic Haircut',
        description: 'Traditional haircut with wash and style',
        price: 25.00,
        durationMin: 30,
        category: 'Haircut',
        barberShopId: barbershop.id,
      }
    }),
    prisma.service.create({
      data: {
        name: 'Premium Haircut',
        description: 'Premium haircut with wash, style, and consultation',
        price: 35.00,
        durationMin: 45,
        category: 'Haircut',
        barberShopId: barbershop.id,
      }
    }),
    prisma.service.create({
      data: {
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        price: 15.00,
        durationMin: 20,
        category: 'Beard',
        barberShopId: barbershop.id,
      }
    }),
    prisma.service.create({
      data: {
        name: 'Haircut & Beard',
        description: 'Complete grooming package including haircut and beard trim',
        price: 35.00,
        durationMin: 50,
        category: 'Package',
        barberShopId: barbershop.id,
      }
    }),
    prisma.service.create({
      data: {
        name: 'Kids Haircut',
        description: 'Specialized haircut for children under 12',
        price: 20.00,
        durationMin: 25,
        category: 'Haircut',
        barberShopId: barbershop.id,
      }
    }),
  ]);

  // Associate services with barbers
  await Promise.all([
    // John can do all services
    prisma.service.update({
      where: { id: services[0].id },
      data: { barbers: { connect: { id: barber1Profile.id } } }
    }),
    prisma.service.update({
      where: { id: services[1].id },
      data: { barbers: { connect: { id: barber1Profile.id } } }
    }),
    prisma.service.update({
      where: { id: services[2].id },
      data: { barbers: { connect: { id: barber1Profile.id } } }
    }),
    prisma.service.update({
      where: { id: services[3].id },
      data: { barbers: { connect: { id: barber1Profile.id } } }
    }),
    prisma.service.update({
      where: { id: services[4].id },
      data: { barbers: { connect: { id: barber1Profile.id } } }
    }),
    // Mike specializes in premium services
    prisma.service.update({
      where: { id: services[1].id },
      data: { barbers: { connect: { id: barber2Profile.id } } }
    }),
    prisma.service.update({
      where: { id: services[2].id },
      data: { barbers: { connect: { id: barber2Profile.id } } }
    }),
    prisma.service.update({
      where: { id: services[3].id },
      data: { barbers: { connect: { id: barber2Profile.id } } }
    }),
  ]);

  // Create client user
  const clientPassword = await hashPassword('client123');
  const client = await prisma.user.create({
    data: {
      email: 'client@example.com',
      passwordHash: clientPassword,
      name: 'John Client',
      role: 'client',
      phone: '+1-555-0124',
    }
  });

  // Create sample slots for today and tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const createSlots = async (date: Date, barberId: string) => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(hour + 1, 0, 0, 0);

      slots.push({
        barberId,
        startTime,
        endTime,
        isBlocked: false,
        isBooked: false,
      });
    }
    return slots;
  };

  const barber1Slots = [
    ...(await createSlots(today, barber1Profile.id)),
    ...(await createSlots(tomorrow, barber1Profile.id)),
  ];

  const barber2Slots = [
    ...(await createSlots(today, barber2Profile.id)),
    ...(await createSlots(tomorrow, barber2Profile.id)),
  ];

  await prisma.slot.createMany({
    data: [...barber1Slots, ...barber2Slots]
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Sample Data Created:');
  console.log(`👤 Super Admin: superadmin@barbershop.com / superadmin123`);
  console.log(`👤 Admin: admin@barbershop.com / admin123`);
  console.log(`✂️  Barber 1: john@elitebarbershop.com / barber123`);
  console.log(`✂️  Barber 2: mike@elitebarbershop.com / barber123`);
  console.log(`👤 Client: client@example.com / client123`);
  console.log(`🏪 Barbershop: Elite Barbershop`);
  console.log(`📅 Slots created for today and tomorrow`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });