global.fetch = jest.fn(() =>
  Promise.reject(new Error('Unexpected network request in a unit test')),
);
