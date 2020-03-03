module.exports.default = jest.fn().mockImplementation(() => {
    return {
        public: 'public-rsa-key-mock',
        private: 'private-rsa-key-mock'
    };
});