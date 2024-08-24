const fetchBusData = async () => {
  try {
    const response = await fetch("/next-departure");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching bus data: ${error}`);
  }
};

const addZero = (n) => (n < 10 ? `0${n}` : n);

const renderDate = () => {
  const date = document.querySelector("#currentDate");
  const dateElem = document.createElement("p");
  const timeElem = document.createElement("p");
  date.textContent = "";

  dateElem.classList.add("fw-bolder");
  timeElem.classList.add("fw-bolder");

  const year = new Date().getFullYear();
  const day = new Date().getDate();
  const month = new Date().getMonth() + 1;
  const time = new Date();

  dateElem.innerHTML = `${addZero(day)}.${addZero(month)}.${year}`;
  timeElem.innerHTML = time.toTimeString().split(" ")[0];

  date.append(dateElem, timeElem);

  setTimeout(renderDate, 1000);
};

const formatDate = (date) => date.toISOString().split("T")[0];
const formatTime = (date) => date.toTimeString().split(" ")[0].slice(0, 5);

const getTimeRemainingSeconds = (departureTime) => {
  const now = new Date();
  const timeDifference = departureTime - now;

  return Math.floor(timeDifference / 1000);
};

const renderBusData = (buses) => {
  const tableBody = document.querySelector("#bus-table tbody");
  tableBody.textContent = "";

  buses.forEach((bus) => {
    const row = document.createElement("tr");

    const nextDepartureTimeUTC = new Date(
      `${bus.nextDeparture.date}T${bus.nextDeparture.time}Z`
    );

    const remainingSeconds = getTimeRemainingSeconds(nextDepartureTimeUTC);
    const remainingTimeText =
      remainingSeconds < 60 ? "Отправляется" : bus.nextDeparture.remaining;

    row.innerHTML = `
        <td>${bus.busNumber}</td>
        <td>${bus.startPoint} - ${bus.endPoint}</td>
        <td>${formatDate(nextDepartureTimeUTC)}</td>
        <td>${formatTime(nextDepartureTimeUTC)}</td>
        <td>${remainingTimeText}</td>
    `;

    tableBody.append(row);
  });
};

const initWebSocket = () => {
  const ws = new WebSocket(`wss://${location.host}`);

  ws.addEventListener("open", () => {
    console.log("WebSocket connection");
  });

  ws.addEventListener("message", (event) => {
    const buses = JSON.parse(event.data);
    renderBusData(buses);
  });

  ws.addEventListener("error", (error) => {
    console.error(`WebSocket error: ${error}`);
  });

  ws.addEventListener("close", () => {
    console.warn(`WebSocket connection closed!`);
  });
};

const init = async () => {
  const buses = await fetchBusData();
  renderBusData(buses);
  renderDate();
  initWebSocket();
};

init();
