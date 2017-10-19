import UsersRepo from '../src/repos/UsersRepo';
import User from '../src/models/User';
import dbConnection from '../src/db/DbConnection';

var id;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
  });
});

const fields = {googleId: '12DJiE9',
  netId: 'ml944',
  firstName: 'Megan',
  lastName: 'Le',
  email: 'ml944@cornell.edu'
};

const checkFields = (user: User) : boolean => {
  expect(user.googleId).toBe(fields.googleId);
  expect(user.netId).toBe(fields.netId);
  expect(user.firstName).toBe(fields.firstName);
  expect(user.lastName).toBe(fields.lastName);
  expect(user.email).toBe(fields.email);
};

test('Create User', async () => {
  const user = await UsersRepo.createUser(fields);
  checkFields(user);
  id = user.id;
});

test('Get User', async () => {
  const user = await UsersRepo.getUserById(id);
  checkFields(user);
});

test('Get Users', async () => {
  const users = await UsersRepo.getUsers();
  const user = await UsersRepo.getUserById(id);
  expect(users).toContainEqual(user);
});

test('Get User by Google Id', async () => {
  const user = await UsersRepo.getUserByGoogleId('12DJiE9');
  checkFields(user);
});

test('Get Assoc Courses of User', async () => {
  const courses = await UsersRepo.getAssocCoursesByUserId(id, null);
  expect(courses).toHaveLength(0);
});

test('Delete User', async () => {
  await UsersRepo.deleteUserById(id);
  expect(await UsersRepo.getUserById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
});
