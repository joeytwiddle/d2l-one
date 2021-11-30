// The root provides a resolver function for each API endpoint
var root = {
  async me() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {
      id: 'User1',
      name: 'Your Name',
    };
  },
};

module.exports = root;
