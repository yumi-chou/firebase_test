import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import PeopleSelect from "./PeopleSelect"; 
import restaurants from "../data/restaurants";
import LoginButton from "./LoginButton";
import api from "../api"; 
import { useAuth } from "../context/AuthContext";

function getTaiwanTimeNow() {
  const now = new Date();
  const tw = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  const hours = tw.getHours();
  const minutes = tw.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  let h = hours;
  let m = roundedMinutes;
  if (m >= 60) {
    m = 0;
    h = (h + 1) % 24;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getTaiwanDateToday() {
  const now = new Date();
  const tw = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  const year = tw.getFullYear();
  const month = String(tw.getMonth() + 1).padStart(2, "0");
  const day = String(tw.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatZhTW(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  const [people, setPeople] = useState(1);
  const [date, setDate] = useState(() => getTaiwanDateToday());
  const [time, setTime] = useState(() => getTaiwanTimeNow());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const timePickerRef = useRef(null);
  const searchRef = useRef(null);

  const [apiResult, setApiResult] = useState(null);
  const [apiError, setApiError] = useState("");

const handleTestAPI = async () => {
  setApiResult(null);
  setApiError("");

  if (!user) {
    openAuth("login");
    return;
  }

  try {
    const res = await api.get("/protected");
    setApiResult(res.data);
  } catch (err) {
    console.error("🔴 Secured API error:", err.response?.status, err.response?.data || err);
    setApiError("呼叫後端 Secured API 失敗，請確認已登入或 Token 是否有效");
  }
};


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target)) {
        setShowTimePicker(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    if (showTimePicker || showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTimePicker, showSearchResults]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const results = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.location.toLowerCase().includes(query) ||
          restaurant.cuisine.toLowerCase().includes(query)
      );
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  return (
    <nav className="bg-[#f0ddbf] shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-[#b22a2a] font-bold text-2xl">
          Resrv
        </Link>

        <div className="flex flex-wrap gap-2 items-center border border-[#b22a2a] rounded-full px-4 py-2 shadow-sm">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10">
              📅
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#b22a2a] bg-white"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              ▼
            </span>
          </div>
          <div className="relative" ref={timePickerRef}>
            <button
              type="button"
              onClick={() => setShowTimePicker(!showTimePicker)}
              className="relative flex items-center pl-10 pr-8 py-2 rounded-full border border-gray-300 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#b22a2a] min-w-[120px] text-left"
            >
              <span className="absolute left-3 text-gray-500 pointer-events-none">
                🕐
              </span>
              {formatZhTW(time || getTaiwanTimeNow())}
              <span className="absolute right-3 text-gray-400 pointer-events-none">
                ▼
              </span>
            </button>
            {showTimePicker && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[150px] max-h-[200px] overflow-hidden">
                <div className="overflow-y-auto max-h-[200px]">
                  {(() => {
                    const slots = [];
                    const startM = 0;
                    const endM = 23 * 60 + 45;
                    for (let m = startM; m <= endM; m += 15) {
                      const h = String(Math.floor(m / 60)).padStart(2, "0");
                      const min = String(m % 60).padStart(2, "0");
                      const t = `${h}:${min}`;
                      const isActive = time === t;
                      slots.push(
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTime(t);
                            setShowTimePicker(false);
                          }}
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                            isActive ? "bg-[#b22a2a] text-white" : "text-gray-700"
                          }`}
                        >
                          {formatZhTW(t)}
                        </button>
                      );
                    }
                    return slots;
                  })()}
                </div>
              </div>
            )}
          </div>

          <PeopleSelect
            maxPeople={20}
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />

          <div className="relative" ref={searchRef}>
            <input
              type="text"
              placeholder="地點、餐廳或料理"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim() && searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              className="px-3 py-2 rounded-full border border-gray-300 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#b22a2a]"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-96 max-h-[400px] overflow-y-auto">
                {searchResults.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => {
                      navigate(`/restaurant/${restaurant.id}`);
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100 last:border-0"
                  >
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-[#b22a2a] text-sm">
                        {restaurant.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {restaurant.cuisine} · {restaurant.location}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="bg-[#b22a2a] text-white px-4 py-2 rounded-full hover:bg-[#e4b326] transition"
            onClick={() => {
              if (searchQuery.trim() && searchResults.length > 0) {
                navigate(`/restaurant/${searchResults[0].id}`);
                setSearchQuery("");
                setShowSearchResults(false);
              }
            }}
          >
            開始搜尋
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/bookings"
            className="text-sm text-[#b22a2a] hover:text-[#e4b326]"
          >
            我的訂位
          </Link>
          <button className="text-sm text-[#b22a2a] hover:text-[#e4b326]">
            加入獎勵
          </button>

          {/* 🔸 測試後端 Secured API 的按鈕 */}
          <button
            onClick={handleTestAPI}
            className="text-sm text-[#b22a2a] border border-[#b22a2a] px-3 py-1 rounded-full hover:bg-[#e4b326] hover:text-white transition"
          >
            測試後端 API
          </button>

          <LoginButton />
        </div>
      </div>


      {apiResult && (
        <div className="max-w-7xl mx-auto px-4 pb-2 text-xs text-gray-700 flex justify-end">
          <div className="bg-green-100 border border-green-300 rounded px-3 py-2">
            <div>訊息：{apiResult.message}</div>
            <div>UID：{apiResult.uid}</div>
            <div>Email：{apiResult.email}</div>
          </div>
        </div>
      )}
      {apiError && (
        <div className="max-w-7xl mx-auto px-4 pb-2 text-xs text-red-700 flex justify-end">
          <div className="bg-red-100 border border-red-300 rounded px-3 py-2">
            {apiError}
          </div>
        </div>
      )}
    </nav>
  );
}
