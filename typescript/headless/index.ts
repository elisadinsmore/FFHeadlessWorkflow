import { FlatfileEvent } from "@flatfile/listener";
import { post } from "../../common/utils/request";
import api from "@flatfile/api";
import { blueprintSheets } from "../../blueprints/benefitsBlueprint";
import { automap } from "@flatfile/plugin-automap";
import { recordHook } from "@flatfile/plugin-record-hook";
import { PipelineJobConfig } from "@flatfile/api/api";
import { getFile } from "../../common/utils/grabFile";

const pushToWebhookSite = async (event: FlatfileEvent) => {
  // Logging the event for debugging purposes
  console.log("pushtoWebhookSite | e: " + JSON.stringify(event));

  // Extracting the spaceId from the event context
  const { spaceId } = event.context;
  const whPath = process.env.WEBHOOK_SITE_PATH;
  // Making a POST request to 'hcm.show' API to sync the space
  return await post({
    hostname: "webhook.site",
    path: whPath,
    body: { spaceId },
  });
};

export default function (listener) {
  // Log the event topic for all events
  listener.on("**", async (event) => {
    console.log("> event.topic: " + event.topic);
    // console.log('> event: ' + util.inspect(event));

    //   const { spaceId } = event.context;
    //   const topic = event.topic;

    //   post({
    //     body: { spaceId, topic },
    //   });
  });

  //create a space to handle the import

  // Add an event listener for the 'job:created' event
  listener.filter({ job: "space:configure" }, (configure) => {
    configure.on("job:ready", async (event) => {
      console.log("Reached the job:ready event callback");

      // Destructure the 'context' object from the event object to get the necessary IDs
      const { spaceId, environmentId, jobId } = event.context;

      const space = await api.spaces.get(spaceId);

      //log spaceId
      console.log("Space: " + JSON.stringify(space));

      const updateJob1 = await api.jobs.ack(jobId, {
        info: "Creating Space",
        progress: 10,
      });

      console.log("Updated Job: " + JSON.stringify(updateJob1));

      // Log the environment ID to the console
      console.log("env: " + environmentId);
      console.log("spaceId " + spaceId);
      console.log("jobID: " + jobId);

      try {
        // Create a new workbook using the Flatfile API
        const createWorkbook = await api.workbooks.create({
          spaceId: spaceId,
          environmentId: environmentId,
          labels: ["primary"],
          name: "Benefits Workbook",
          sheets: blueprintSheets,
          actions: [
            {
              operation: "submitAction",
              mode: "foreground",
              label: "Submit",
              type: "string",
              description: "Submit Data to HCM Show",
              primary: true,
            },
          ],
        });

        const workbookId = createWorkbook.data.id;
        if (workbookId) {
          console.log("Created Workbook with ID:" + workbookId);

          // Update the space to set the primary workbook and theme using api.spaces.update
          const updatedSpace = await api.spaces.update(spaceId, {
            environmentId: environmentId,
            primaryWorkbookId: workbookId,
            guestAuthentication: ["shared_link"],
            metadata: {
              sidebarConfig: {
                showSidebar: true,
                // This property seems to break guest magic link functionality?
                // showGuestInvite: true,
              },
              theme: {
                root: {
                  primaryColor: "#090B2B",
                  warningColor: "#FF9800",
                },
                sidebar: {
                  logo: `https://images.ctfassets.net/e8fqfbar73se/4c9ouGKgET1qfA4uxp4qLZ/e3f1a8b31be67a798c1e49880581fd3d/white-logo-w-padding.png`,
                  textColor: "#FFFFFF",
                  titleColor: "#FFFFFF",
                  focusBgColor: "#616A7D",
                  focusTextColor: "#FFFFFF",
                  backgroundColor: "#090B2B",
                  footerTextColor: "#FFFFFF",
                  textUltralightColor: "#FF0000",
                },
                table: {
                  inputs: {
                    radio: {
                      color: "rgb(8 117 225)",
                    },
                    checkbox: {
                      color: "rgb(8 117 225)",
                    },
                  },
                  filters: {
                    color: "#808080",
                    active: {
                      backgroundColor: "rgb(8 117 225)",
                    },
                    error: {
                      activeBackgroundColor: "#FA8072",
                    },
                  },
                  column: {
                    header: {
                      fontSize: "12px",
                      backgroundColor: "rgb(240 240 240)",
                      color: "#678090",
                      dragHandle: {
                        idle: "rgb(8 117 225)",
                        dragging: "#0000FF",
                      },
                    },
                  },
                  fontFamily: "Arial",
                  indexColumn: {
                    backgroundColor: "rgb(240 240 240)",
                    selected: {
                      color: "rgb(240 240 240)",
                      backgroundColor: "rgb(200 200 200)",
                    },
                  },
                  cell: {
                    selected: {
                      backgroundColor: "rgb(235 245 255)",
                    },
                    active: {
                      borderColor: "rgb(8 117 225)",
                      spinnerColor: "#808080",
                    },
                  },
                  boolean: {
                    toggleChecked: "rgb(240 240 240)",
                  },
                  loading: {
                    color: "rgb(240 240 240)",
                  },
                },
              },
            },
          });

          // Log the ID of the updated space to the console
          console.log("Updated Space with ID: " + updatedSpace.data.id);
        } else {
          console.log("Unable to retrieve workbook ID from the response.");
        }
      } catch (error) {
        console.log("Error creating workbook or updating space:", error);
      }

      const createDoc = await api.documents.create(spaceId, {
        title: "Welcome",
        body: `<div> 
    <h1 style="margin-bottom: 36px;">Welcome! We're excited to offer you a seamless, one-click experience for loading your data into Flatfile.</h1>
    <h2 style="margin-top: 0px; margin-bottom: 12px;">To get started, follow these steps:</h2>
    <h2 style="margin-bottom: 0px;">1. Inspect the Automatically Uploaded File</h2>
    <p style="margin-top: 0px; margin-bottom: 8px;">Click "Files" in the left-hand sidebar. Here, you can view the original file that was automatically imported into Flatfile from Google Drive.</p>
    <h2 style="margin-bottom: 0px;">2. Examine the Imported Benefit Elections Data</h2>
    <p style="margin-top: 0px; margin-bottom: 8px;">Click on the "Benefit Elections" workbook in the left-hand sidebar. This will display the data the remaining invalid values from the Google Drive file.</p>
    <h2 style="margin-bottom: 0px;">3. Confirm the Data Load into your webhook.site URL</h2>
    <p style="margin-top: 0px; margin-bottom: 12px;">As part of this process, we've automatically uploaded a file, mapped the data, and loaded all valid records into your webhook.site URL.</p>
    <h3 style="margin-top: 0px; margin-bottom: 12px;">Remember, if you need any assistance, you can always refer back to this page by clicking "Welcome" in the left-hand sidebar!</h3>
</div>`,
      });

      console.log("Created Document");

      // try {
      //   const fileAttempt = await getFile();

      //   const importFile = await api.files.upload(fileAttempt, spaceId);
      //   console.log(`${importFile}`);
      // } catch (error) {
      //   console.log("Error importing file to space: ", error);
      // }

      // Update the job status to 'complete' using the Flatfile API
      const updateJob = await api.jobs.update(jobId, {
        status: "complete",
      });

      //   // Log the result of the updateJob function to the console as a string
      console.log(
        "Updated Job With ID to Status Complete: " + updateJob.data.id
      );
    });

    // Handle the 'job:failed' event
    configure.on("job:failed", async (event) => {
      console.log("Job Failed: " + JSON.stringify(event));
    });
  });

  //automap the imported file
  listener.use(
    automap({
      accuracy: "confident",
      matchFilename: /^benefits.*$/i,
      defaultTargetSheet: "Benefit Elections",
      debug: true,
    })
  );

  //example of validation to run on the sheet
  listener.use(
    recordHook("benefit-elections-sheet", (record) => {
      const employeeId = parseInt(
        (record.get("employeeId") as string).replace(",", "")
      );
      const newId = employeeId / 1000;
      record.set("employeeId", newId);
      return record;
    })
  );

  // listener.filter({ job: "workbook:submitAction" }, (configure) => {
  //   configure.on("job:ready", async (event: FlatfileEvent) => {
  //     const { jobId, spaceId } = event.context;
  //     try {
  //       await api.jobs.ack(jobId, {
  //         info: "Sending data to Webhook.Site.",
  //         progress: 10,
  //       });

  //       let callback;
  //       try {
  //         // Call the submit function with the event as an argument to push the data to HCM Show
  //         const sendToShowSyncSpace = await pushToWebhookSite(event);
  //         callback = JSON.parse(sendToShowSyncSpace);

  //         // Log the action as a string to the console
  //         console.log("Action: " + JSON.stringify(event?.payload?.operation));
  //       } catch (error) {
  //         // Handle the error gracefully, log an error message, and potentially take appropriate action
  //         console.log("Error occurred during HCM workbook submission:", error);
  //         // Perform error handling, such as displaying an error message to the user or triggering a fallback behavior
  //       }

  //       if (callback.success) {
  //         await api.jobs.complete(jobId, {
  //           info: "Data synced to the HCM.show app.",
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error:", error.stack);

  //       await api.jobs.fail(jobId, {
  //         info: "The submit job did not run correctly.",
  //       });
  //     }
  //   });
  // });

  //This listener grabs submitted records from the sheet
  listener.on("job:completed", { job: "workbook:map" }, async (event) => {
    // get key identifiers, including destination sheet Id
    const { jobId, spaceId, environmentId, workbookId } = event.context;

    const job = await api.jobs.get(jobId);
    const config = job.data.config as PipelineJobConfig;

    const destinationSheetId = config?.destinationSheetId;

    // get the valid records from the sheet
    const importedData = await api.records.get(destinationSheetId, {
      filter: "valid",
    });

    try {
      // Push them to Webhook.site
      console.log("Pushing to Webhook.site");
      post({
        body: { spaceId, workbookId, importedData },
      });

      //console.log(JSON.stringify(success));
    } catch (error) {
      console.log("couldn't complete " + error);
    }

    // TODO: Get a list of successfully synced records IDs back
    // so we don't delete records that didn't sync.
    await pushToWebhookSite(event);

    // Delete the valid records from the sheet
    const recordIds = importedData.data.records.map((r) => r.id);
    console.log("Deleting " + recordIds.length + " valid records.");

    //Split the recordIds array into chunks of 100
    for (let i = 0; i < recordIds.length; i += 100) {
      const batch = recordIds.slice(i, i + 100);

      // Delete the batch
      await api.records.delete(destinationSheetId, {
        ids: batch,
      });

      console.log(`Deleted batch from index ${i} to ${i + 100}`);
    }

    console.log("Done");
  });
}
