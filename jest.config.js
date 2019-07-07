module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/test/.*\\.test\\.tsx?)$',
  collectCoverageFrom: ['src/**/*.ts'],
  setupFilesAfterEnv: ['./node_modules/jest-enzyme/lib/index.js', '<rootDir>/test/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/test/__mocks__/styleMock.ts'
  }
}
