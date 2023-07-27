import fetch from "node-fetch";

export const getFile = async (): Promise<File> => {
  const response = await fetch(
    "https://raw.githubusercontent.com/FlatFilers/platform-sdk-starter/main/examples/sample-uploads/employees-sample.csv"
  );
  const blob = await response.blob();
  const newFile = new File([blob], "test");

  return newFile;
};
