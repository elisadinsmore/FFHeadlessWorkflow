import { SheetConfig } from "@flatfile/api/api";

// Benefit Elections Sheet
const sheet: SheetConfig = {
  name: "Employees",
  slug: "benefit-elections-sheet",
  readonly: false,
  fields: [
    {
      key: "first",
      label: "First Name",
      description: "First Name of Employee",
      type: "string",
      constraints: [{ type: "required" }],
    },

    {
      key: "last",
      label: "Last Name",
      description: "Last Name of Employee",
      type: "string",
      constraints: [{ type: "required" }],
    },

    {
      key: "name",
      label: "Full Name",
      description: "Full Name of employee",
      type: "string",
      constraints: [{ type: "required" }],
    },

    {
      key: "bool",
      label: "Currently Employed",
      description: "Is the employee currently employed with us?",
      type: "boolean",
      constraints: [{ type: "required" }],
    },

    {
      key: "startDate",
      label: "Start Date",
      description:
        "Date coverage begins for this benefit plan. Must be formatted as yyyy-MM-dd",
      type: "date",
    },

    {
      key: "salary",
      label: "Employee Salary",
      type: "number",
      description:
        "Employer contribution for this benefit plan per plan frequency.",
      constraints: [{ type: "required" }],
    },

    {
      key: "department",
      label: "Department",
      type: "enum",
      description: "Employee Department",
      constraints: [{ type: "required" }],
      config: {
        options: [
          {
            value: "engineering",
            label: "Product Engineering",
          },

          {
            value: "hr",
            label: "People Ops",
          },
          {
            value: "sales",
            label: "Sales",
          },
        ],
      },
    },
  ],
};

export const blueprintSheets = [{ ...sheet }];
