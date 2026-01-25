/**
 * Formats population numbers into a human-readable string.
 * @param {number} population - The population number to format.
 * @returns {string} - Formatted population string.
 */
export const formatPopulation = (population) => {
    if (population === undefined || population === null) return 'Unknown';
    if (population === 0) return 'Uninhabited';

    if (population >= 1000000000) {
        return (population / 1000000000).toFixed(1) + 'B';
    }
    if (population >= 1000000) {
        return (population / 1000000).toFixed(1) + 'M';
    }
    if (population >= 1000) {
        return (population / 1000).toFixed(1) + 'K';
    }
    return population.toString();
};
