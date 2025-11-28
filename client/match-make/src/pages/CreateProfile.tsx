import {
  Button,
  FileInput,
  NativeSelect,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiUpload } from "react-icons/bi";
import { IMaskInput } from "react-imask";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
const CreateProfile = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      teamName: "",
      location: "",
      logo_url: "",
      description: "",
      skill_level: "",
    },

    validate: {
      teamName: (value) =>
        value.length < 6
          ? "Team name must be more than 6 characters"
          : !value
          ? "Team name cannot be empty"
          : null,

      location: (value) => (!value ? "Location cannot be empty" : null),
      description: (value) =>
        !value
          ? "Team description cannot be empty"
          : value.length < 10
          ? "Team info should be more than 10 characters"
          : null,
    },
    validateInputOnChange: true,
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:3000/teams/create-profile",
        {
          teamName: values.teamName,
          location: values.location,
          logo_url: values.logo_url,
          description: values.description,
          skill_level: values.skill_level,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      console.log(response.data.team);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error updating team details---", error);
      toast.error("Error creating team profile");
      setErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="create-profile pt-24 px-10 sm:px-10 md:px-14 lg:px-32 pb-10">
      <div>
        <h4 className="text-2xl md:text-4xl font-bold">
          Create Your Team profile
        </h4>
        <p className="mt-2">
          Fill in the details below to setup your team profile
        </p>
      </div>

      <div className="mt-8">
        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
          <TextInput
            label="Team Name"
            placeholder="Enter Your Team Name"
            radius="md"
            ta={"left"}
            {...form.getInputProps("teamName")}
            required
          />

          <div className="flex items-center gap-4 bg-transparent min-h-14 justify-between">
            <div className="flex items-center gap-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-16"
                data-alt="Team logo placeholder"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCZm9sZ-I7-10I8tcv8wyM85SFEgkeTTUZPrdnl7M1AukxRK_21VIe8f5VyQ1iorYligPc_RDDsi6XPHnyM27A3Uvq94QIfaBKiilt7wpuO3xczK6TnFPAwxYMEnPPNzApLKXaIBj1vmT0V1kv0vTg4qBLbCfcFf-mdLiCYSWyOvCC4GS0ga9leyFB02uiw60Iot8hiBoqsLKpr-ELjSQMP-acxw8trmza9nPjdZfATez8ia1tkcgqqVzdJeJsWYbNDs-x7XWMIDv8')",
                }}
              ></div>
              <div className="flex flex-col">
                <p className="text-secondary dark:text-white text-base font-medium leading-normal">
                  Team Logo
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Best image format: PNG, JPG. Max size: 2MB
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <label
                className="cursor-pointer text-green-400 font-medium text-base leading-normal flex items-center gap-2"
                htmlFor="logo-upload"
              >
                <span className="text-green-400 text-lg">
                  <BiUpload />
                </span>
                Upload
              </label>
              <input className="hidden" id="logo-upload" type="file" />
            </div>
          </div>

          <TextInput
            label="Location"
            placeholder="Enter Your Location"
            radius="md"
            ta={"left"}
            required
            {...form.getInputProps("location")}
          />

          <Select
            label="Skill level"
            placeholder="Select your skill level"
            description="Your team lvl"
            data={[
              {
                value: "beginner",
                label: "Beginner",
              },
              {
                value: "intermediate",
                label: "Intermediate",
              },
              {
                value: "expert",
                label: "Expert",
              },
            ]}
            {...form.getInputProps("skill_level")}
          />

          <Textarea
            rows={5}
            required
            label="About Your Team"
            {...form.getInputProps("description")}
            placeholder="Tell us about your team's history, your style of play, and what you are looking for"
          />

          <div className="flex justify-end gap-3 items-center">
            {errorMessage && (
              <p className="text-xs text-red-500 italic">
                Error updating profile
              </p>
            )}
            <Button type="submit">
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
