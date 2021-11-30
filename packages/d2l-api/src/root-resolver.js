// The root provides a resolver function for each API endpoint
var root = {
  me: () => {
    return {
      id: 'User1',
      name: 'Your Name',
    };
  },
};

module.exports = root;
