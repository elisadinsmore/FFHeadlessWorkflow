import api from "@flatfile/api";
import { FlatfileListener, FlatfileEvent, Client } from "@flatfile/listener";

export default function (listener: Client) {
  listener.filter({ job: "space:configure" }, (configure: FlatfileListener) => {
    configure.on(
      "job:ready",
      async ({ context: { spaceId, environmentId, jobId } }: FlatfileEvent) => {
        try {
          await api.jobs.ack(jobId, {
            info: "Gettin started.",
            progress: 10,
          });

          await api.workbooks.create({
            spaceId,
            environmentId,
            name: "All Data",
            labels: ["pinned"],
            sheets: [
              {
                name: "Contacts",
                slug: "contacts",
                fields: [
                  {
                    key: "firstName",
                    type: "string",
                    label: "First Name",
                  },
                  {
                    key: "lastName",
                    type: "string",
                    label: "Last Name",
                  },
                  {
                    key: "email",
                    type: "string",
                    label: "Email",
                  },
                ],
                actions: [
                  {
                    operation: "duplicate",
                    mode: "background",
                    label: "Duplicate Sheet",
                    type: "string",
                    description:
                      "Duplicate this Sheet and lock down the original.",
                    primary: true,
                  },
                ],
              },
            ],
            actions: [
              {
                operation: "submitActionFg",
                mode: "foreground",
                label: "Submit foreground",
                type: "string",
                description: "Submit data to webhook.site",
                primary: true,
              },
            ],
          });

          await api.documents.create(spaceId, {
            title: "Getting Started",
            body:
              "# Welcome\n" +
              "### Say hello to your first customer Space in the new Flatfile!\n" +
              "Let's begin by first getting acquainted with what you're seeing in your Space initially.\n" +
              "---\n",
          });

          await api.jobs.complete(jobId, {
            outcome: {
              message: "This job is now complete.",
            },
          });
        } catch (error) {
          console.error("Error:", error.stack);

          await api.jobs.fail(jobId, {
            outcome: {
              message: "This job encountered an error.",
            },
          });
        }
      }
    );
  });

  listener.filter(
    { job: "workbook:submitActionFg" },
    (configure: FlatfileListener) => {
      configure.on(
        "job:ready",
        async ({ context: { jobId } }: FlatfileEvent) => {
          try {
            await api.jobs.ack(jobId, {
              info: "Gettin started.",
              progress: 10,
            });

            //make changes after cells in a Sheet have been updated
            console.log("make changes here when an action is clicked");

            await api.jobs.complete(jobId, {
              outcome: {
                message: "This job is now complete.",
              },
            });
          } catch (error) {
            console.error("Error:", error.stack);

            await api.jobs.fail(jobId, {
              outcome: {
                message: "This job encountered an error.",
              },
            });
          }
        }
      );
    }
  );

  listener.filter({ sheet: "Contacts" }, (configure: FlatfileListener) => {
    listener.on("commit:created", async (event: FlatfileEvent) => {
      //make changes after cells in a Sheet have been updated
      console.log("made it here");
    });
  });
}
