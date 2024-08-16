const mock = require('mock-fs');
const path = require('path');
const {
  getTotalSpecs,
  getFixtureFolderPattern,
  getExcludeSpecPattern,
  getSpecPattern,
} = require('../../lib/utils/specCountCalculation');

const sep = path.sep;

describe('spec count calculation', () => {
  describe('getTotalSpecs', () => {
    beforeEach(() => {
      mock({
        'cypress/tests': {
          'example1.spec.js': '',
          'example2.spec.js': '',
          'example3.spec.js': '',
          'example4.spec.ts': '',
          'example.ignore.spec.js': '',
        },
        'cypress/support': {
          'index.js': '',
        },
        'cypress/fixtures': {
          'fixtures1.js': '',
          'fixtures2.js': '',
        },
      });
    });

    afterEach(() => {
      mock.restore();
    });

    it('testFiles, integrationFolder, supportFile are specified: should count all files from integration folder', () => {
      let specConfig = {
        testFiles: '**/*.*',
        ignoreTestFiles: '*.hot-update.js',
        fixturesFolder: 'cypress/fixtures',
        integrationFolder: 'cypress/tests',
        supportFile: 'cypress/support/index.js',
      };

      let specCount = getTotalSpecs(specConfig);

      expect(specCount).toEqual(5);

      specConfig = {
        excludeSpecPattern: '*.hot-update.js',
        specPattern: 'cypress/tests/**/*.spec.{js,ts}',
        supportFile: 'cypress/support/index.js',
        fixturesFolder: 'cypress/fixtures',
      };

      specCount = getTotalSpecs(specConfig);

      expect(specCount).toEqual(5);
    });

    it('ignoreTestFiles are specified: should ignore specified files', () => {
      let specConfig = {
        testFiles: '**/*.*',
        ignoreTestFiles: ['*.hot-update.js', '*.ignore.*.*'],
        fixturesFolder: 'cypress/fixtures',
        integrationFolder: 'cypress/tests',
        supportFile: 'cypress/support/index.js',
      };

      let specCount = getTotalSpecs(specConfig);

      expect(specCount).toEqual(4);

      specConfig = {
        specPattern: 'cypress/tests/**/*.spec.{js,ts}',
        excludeSpecPattern: ['*.hot-update.js', '*.ignore.spec.*'],
        supportFile: 'cypress/support/index.js',
        fixturesFolder: 'cypress/fixtures',
      };

      specCount = getTotalSpecs(specConfig);

      expect(specCount).toEqual(4);
    });
  });

  describe('getFixtureFolderPattern', () => {
    it('returns a glob pattern for fixtures folder', () => {
      const specConfig = { fixturesFolder: `cypress${sep}fixtures` };

      const specArray = getFixtureFolderPattern(specConfig);
      expect(specArray).toHaveLength(1);
      expect(specArray).toContain(`cypress${sep}fixtures${sep}**${sep}*`);
    });
  });

  describe('getExcludeSpecPattern', () => {
    it('getExcludeSpecPattern returns required pattern for cypress version <= 9', () => {
      const specConfigString = {
        integrationFolder: 'cypress/integration',
        ignoreTestFiles: '*.hot-update.js',
        fixturesFolder: 'cypress/fixtures',
        supportFile: 'cypress/support/index.js',
      };

      const specConfigArray = {
        integrationFolder: 'cypress/integration',
        ignoreTestFiles: ['*.hot-update.js', '*.hot-update.ts'],
        fixturesFolder: 'cypress/fixtures',
        supportFile: 'cypress/support/index.js',
      };

      let patternArray = getExcludeSpecPattern(specConfigString);
      expect(patternArray).toHaveLength(1);
      expect(patternArray).toContain('*.hot-update.js');

      patternArray = getExcludeSpecPattern(specConfigArray);
      expect(patternArray).toHaveLength(2);
      expect(patternArray).toContain('*.hot-update.js');
      expect(patternArray).toContain('*.hot-update.ts');
    });
  });

  describe('getSpecPattern', () => {
    it('returns the required glob pattern for cypress <=9 config when testFiles is an array', () => {
      const specConfig = {
        integrationFolder: 'cypress/integration',
        testFiles: ['**/*.js', '**/*.ts'],
      };

      const patternArray = getSpecPattern(specConfig);
      expect(patternArray).toHaveLength(2);
      expect(patternArray[0]).toEqual(
        path.join(specConfig.integrationFolder, specConfig.testFiles[0]),
      );
      expect(patternArray[1]).toEqual(
        path.join(specConfig.integrationFolder, specConfig.testFiles[1]),
      );
    });

    it('getSpecPattern returns the required glob pattern for cypress >= 10 config when specPattern is an array', () => {
      const specConfig = {
        specPattern: ['cypress/integration/**/*.js', 'cypress/integration/**/*.js'],
      };

      const patternArray = getSpecPattern(specConfig);
      expect(patternArray).toHaveLength(2);
      expect(patternArray[0]).toEqual(specConfig.specPattern[0]);
      expect(patternArray[1]).toEqual(specConfig.specPattern[1]);
    });

    it('getSpecPattern returns the required glob pattern for cypress >= 10 config when specPattern is a string', () => {
      const specConfig = {
        specPattern: 'cypress/integration/**/*.js',
      };

      const patternArray = getSpecPattern(specConfig);
      expect(patternArray).toHaveLength(1);
      expect(patternArray[0]).toEqual(specConfig.specPattern);
    });

    it('getSpecPattern returns the required glob pattern for cypress <= 9 config when testFiles is a string', () => {
      const specConfig = {
        integrationFolder: 'cypress/integration',
        testFiles: '**/*.js',
      };

      const patternArray = getSpecPattern(specConfig);
      expect(patternArray).toHaveLength(1);
      expect(patternArray[0]).toEqual(
        path.join(specConfig.integrationFolder, specConfig.testFiles),
      );
    });
  });
});
