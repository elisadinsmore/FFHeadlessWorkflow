//import axios from "axios";
import * as fs from "fs";
import api from "@flatfile/api";

export const getFile = async (spaceId, environmentId): Promise<void> => {
  try {
    //grab local file in this example, convert to ReadStream
    const reader = fs.createReadStream(
      "./typescript/headless/employees-sample.csv"
    );
    //Upload file to Flatfile Upload endpoint as "import" mode
    await api.files.upload(reader, {
      spaceId,
      environmentId,
      mode: "import",
    });

    console.log("Imported File to Space: " + spaceId);

    reader.close();
  } catch (uploadError: unknown) {
    console.error("Failed to upload file");
    console.error(JSON.stringify(uploadError, null, 2));
  }
};
