import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { SEED_EMPLOYEES } from './employees.seed';

async function runSeed() {
  const isFresh = process.argv.includes('--fresh');

  const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [Employee],
    synchronize: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('✓ Database connection established');

    const employeeRepo = AppDataSource.getRepository(Employee);

    if (isFresh) {
      console.log('⚠ --fresh flag detected. Clearing all employees...');
      await employeeRepo.delete({});
      console.log('✓ All employees cleared');
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const seedData of SEED_EMPLOYEES) {
      // Validate required fields
      if (!seedData.email || !seedData.password || !seedData.role || !seedData.fullName) {
        console.error(
          `✗ Skipping invalid seed data: missing required fields`,
          seedData,
        );
        continue;
      }

      // Check if employee already exists
      const existing = await employeeRepo.findOne({
        where: { email: seedData.email },
      });

      if (existing && !isFresh) {
        console.log(`⊘ Skipped (exists): ${seedData.email}`);
        skippedCount++;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(seedData.password, 10);

      // Create and insert employee
      const employee = new Employee();
      employee.email = seedData.email;
      employee.password = hashedPassword;
      employee.role = seedData.role;
      employee.fullName = seedData.fullName;
      if (seedData.phone) employee.phone = seedData.phone;
      if (seedData.department) employee.department = seedData.department;
      if (seedData.position) employee.position = seedData.position;
      if (seedData.joinedAt) employee.joinedAt = seedData.joinedAt;
      employee.isActive = true;

      await employeeRepo.save(employee);
      console.log(`✓ Seeded: ${seedData.email} (${seedData.role})`);
      insertedCount++;
    }

    console.log('\n--- Seed Summary ---');
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Total processed: ${insertedCount + skippedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeed();
