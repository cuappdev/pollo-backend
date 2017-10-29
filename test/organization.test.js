import OrganizationRepo from '../src/repos/OrganizationsRepo';
import dbConnection from '../src/db/DbConnection';

// Connects to db before running tests
beforeAll(() => {
  dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
});

var id;

test('Create Organization', async () => {
  const org = await OrganizationRepo.createOrganization('Cornell University');
  expect(org.name).toBe('Cornell University');
  id = org.id;
});

test('Get Organization', async () => {
  const org = await OrganizationRepo.getOrgById(id);
  expect(org.name).toBe('Cornell University');
  expect(org.id).toBe(id);
});

test('Get Organizations', async () => {
  const orgs = await OrganizationRepo.getOrganizations();
  const org = await OrganizationRepo.getOrgById(id);
  expect(orgs).toContainEqual(org);
});

test('Update Organization', async () => {
  const org = await OrganizationRepo.updateOrgById(id, 'New Name');
  expect(org.name).toBe('New Name');
});

test('Delete Organization', async () => {
  await OrganizationRepo.deleteOrgById(id);
  expect(await OrganizationRepo.getOrgById(id)).not.toBeDefined();
});

afterAll(async () => {
  // await OrganizationRepo.deleteOrgById(id);
});
