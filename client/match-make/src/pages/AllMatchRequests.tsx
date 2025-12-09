import { useContext, useEffect, useState } from "react";
import { MatchRequestsContext } from "../contexts/MatchRequestsContext";

import { BiBarChart, BiCalendar, BiSearch } from "react-icons/bi";
import { CiLocationOn } from "react-icons/ci";
import {
  MdCalendarMonth,
  MdOutlineFilter9Plus,
  MdSearchOff,
} from "react-icons/md";
import { DatePicker } from "@mantine/dates";
import { Button, Loader } from "@mantine/core";
import { toast } from "react-toastify";
import { TeamContext } from "../contexts/TeamContext";
import { useNavigate } from "react-router";

interface matchRequestProps {
  id: number;
  created_at: string;
  date: string;
  location: string;
  message: string;
  status: string;
  team_id: number;
  team_name: string;
  time: string;
}
const AllMatchRequests = () => {
  const matchRequestsContext = useContext(MatchRequestsContext);
  if (!matchRequestsContext)
    throw new Error("Cannot get match request context");
  const {
    getOpenedRequest,
    openedRequests,
    acceptMatchRequest,
    getAllChallenges,
    loading,
  } = matchRequestsContext;
  const [activeTab, setActiveTab] = useState(0);
  const teamContext = useContext(TeamContext);
  if (!teamContext) throw new Error("Cannot get team context");
  const { teamDetails, getTeamDetails } = teamContext;
  const navigate = useNavigate();

  const handleActiveChanege = (id: number) => {
    setActiveTab((prev) => (prev === id ? prev : id));
  };

  useEffect(() => {
    getOpenedRequest();
    getTeamDetails();
    getAllChallenges();
  }, []);

  console.log("Team details", teamDetails);

  function convertTo12Hour(time24: any) {
    const [hours, minutes] = time24.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",

      hour12: true,
    });
  }

  function formatDate(dateString: any) {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formatted;
  }

  const handleAcceptMatchRequest = async (id: number) => {
    try {
      const result = await acceptMatchRequest(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Something went wrong, cant accept", error);
      toast.error("Something went wrong, error");
    }
  };

  return (
    <div className="relative pt-20 flex h-auto min-h-screen w-full flex-col">
      <div className="flex flex-1">
        <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-72 flex-shrink-0 flex-col border-r border-white/10 bg-background-dark p-6 lg:flex">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-primary">
                <MdOutlineFilter9Plus className="text-primary bg-primary border-primary" />
              </span>
              <div className="flex flex-col">
                <p className="text-[16px] font-medium text-white">Filters</p>
                <p className="text-xs font-normal text-gray-400">
                  Refine your search
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-gray-400">
                    <BiCalendar />
                  </span>
                  <p className="text-sm font-medium text-gray-200">Date</p>
                </div>
                <div className="">
                  <DatePicker />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-gray-400">
                    <CiLocationOn />
                  </span>
                  <p className="text-sm font-medium text-gray-200">Location</p>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                    <BiSearch />
                  </span>
                  <input
                    className="h-10 w-full rounded-md border border-white/10 bg-background-dark pl-10 text-sm focus:border-primary focus:ring-primary placeholder:text-gray-500"
                    placeholder="Enter a city or address"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-gray-400">
                    <BiBarChart />
                  </span>
                  <p className="text-sm font-medium text-gray-200">
                    Skill Level
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      className="h-4 w-4 rounded border-gray-600 text-primary focus:ring-primary bg-gray-800 ring-offset-background-dark"
                      name="skill-beginner"
                      type="checkbox"
                    />
                    <span className="text-sm text-gray-300">Beginner</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      className="h-4 w-4 rounded border-gray-600 text-primary focus:ring-primary bg-gray-800 ring-offset-background-dark"
                      name="skill-intermediate"
                      type="checkbox"
                    />
                    <span className="text-sm text-gray-300">Intermediate</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      className="h-4 w-4 rounded border-gray-600 text-primary focus:ring-primary bg-gray-800 ring-offset-background-dark"
                      name="skill-advanced"
                      type="checkbox"
                    />
                    <span className="text-sm text-gray-300">Advanced</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-8">
            <button className="flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold text-white">
              Apply Filters
            </button>
            <button className="flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent px-4 text-sm font-bold text-gray-300 hover:bg-white/10">
              Reset
            </button>
          </div>
        </aside>
        <main className="w-full flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-white">
              Opened Match Requests
            </h1>
            <p className="mt-2 text-gray-400">
              Browse and challenge teams for your next game.
            </p>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 p-1 md:w-auto">
                {["All Requests", "My Team's Requests"].map((tab, index) => (
                  <Button
                    onClick={() => handleActiveChanege(index)}
                    color={activeTab === index ? "blue" : "gray"}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
              <div className="flex w-full flex-col-reverse gap-4 md:w-auto md:flex-row md:items-center">
                <div className="relative w-full md:max-w-xs">
                  <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                    <BiSearch />
                  </span>
                  <input
                    className="h-12 w-full rounded-lg border border-white/10 bg-background-dark pl-12 text-sm focus:border-primary focus:ring-primary placeholder:text-gray-500"
                    placeholder="Search by team name..."
                    type="text"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              {loading.getOpenedRequest && (
                <div className="h-[10vh] flex items-center justify-center">
                  <Loader size={20} />
                </div>
              )}
              {!loading.getOpenedRequest && openedRequests.length === 0 && (
                <div className="col-span-1 flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-gray-900/40 p-6 text-center xl:col-span-2">
                  <span className="material-symbols-outlined text-6xl text-gray-500">
                    <MdSearchOff />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    No Requests Found
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    No open challenges found. Check back later!
                  </p>
                  <Button
                    onClick={() => navigate("/teams")}
                    className="mt-6 flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white"
                  >
                    Find and Challenge Team
                  </Button>
                </div>
              )}

              {!loading.getOpenedRequest &&
                openedRequests.map((request: matchRequestProps) => (
                  <div className="flex flex-col rounded-xl border border-white/10 bg-gray-900/40 p-6 transition-shadow hover:shadow-lg hover:border-white/20">
                    <div className="flex items-start gap-4">
                      <img
                        className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-700 p-1"
                        data-alt="team logo"
                        alt={`${request.team_name} logo`}
                        src="/emblem.png"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white">
                            {request.team_name}
                          </h3>
                          <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-300">
                            {request.team_id === teamDetails?.id
                              ? `Owner - ${request.status}`
                              : request.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                          "{request.message}"
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-4">
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="material-symbols-outlined text-lg text-primary">
                          <MdCalendarMonth />
                        </span>
                        <p>
                          {formatDate(request.date)} -{" "}
                          {convertTo12Hour(request.time)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="material-symbols-outlined text-lg text-primary">
                          <CiLocationOn />
                        </span>
                        <p>{request.location}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      <Button
                        loading={loading.acceptMatchRequest}
                        onClick={() => handleAcceptMatchRequest(request.id)}
                        disabled={request?.team_id === teamDetails?.id}
                        className="flex  flex-1"
                      >
                        Challenge
                      </Button>
                      <Button color="gray" className="flex flex-1 ">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllMatchRequests;
