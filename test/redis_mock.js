//"The statement 'import redis from redis' doesn't work, but other ES6 modules do :(
export default {
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  })),
};

