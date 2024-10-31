let loadingInterval = null;

export const startLoading = (message = "Loading") => {
  let dots = "";

  // Prevent multiple intervals if startLoading is called again
  if (loadingInterval) clearInterval(loadingInterval);

  loadingInterval = setInterval(() => {
    dots += ".";
    if (dots.length > 3) dots = ""; // Reset dots after three
    process.stdout.write(`\r${message}${dots}`); // Display loading message in console
  }, 500); // Update every half-second
};

export const stopLoading = () => {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
    process.stdout.write("\r"); // Clear the loading line in console
    console.log(); // Move to the next line after stopping
  }
};
