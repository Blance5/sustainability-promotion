(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const chart = document.querySelector("[data-chart]");
  if (chart) {
    const buttons = Array.from(chart.querySelectorAll(".bar-btn"));
    const detail = document.querySelector("[data-chart-detail]");
    const title = detail.querySelector("h3");
    const text = detail.querySelector("p");
    function show(button) {
      buttons.forEach(function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      title.textContent = button.dataset.title;
      text.textContent = button.dataset.detail;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () { show(button); });
    });
    requestAnimationFrame(function () { chart.classList.add("ready"); });
    if (buttons[0]) show(buttons[0]);
  }

  const map = document.querySelector("[data-map]");
  if (map) {
    const regions = Array.from(map.querySelectorAll(".region"));
    const panel = document.querySelector("[data-map-panel]");
    function select(region) {
      regions.forEach(function (item) {
        item.setAttribute("aria-pressed", item === region ? "true" : "false");
      });
      panel.innerHTML = "<h3>" + region.dataset.title + "</h3><p>" + region.dataset.detail + "</p>";
    }
    regions.forEach(function (region) {
      region.addEventListener("click", function () { select(region); });
    });
    if (regions[0]) select(regions[0]);
  }

  const timeline = document.querySelector("[data-timeline]");
  if (timeline) {
    timeline.querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", function () {
        const open = button.getAttribute("aria-expanded") === "true";
        timeline.querySelectorAll("button").forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          const extra = other.nextElementSibling;
          if (extra) extra.hidden = true;
        });
        button.setAttribute("aria-expanded", open ? "false" : "true");
        const panel = button.nextElementSibling;
        if (panel) panel.hidden = open;
      });
    });
  }

  const quiz = document.querySelector("[data-quiz]");
  if (!quiz) return;

  const questions = [
    {
      prompt: "How much time can you realistically give a trip?",
      options: [
        { label: "A few hours, and I want to be back the same day.", tags: ["short", "calm"] },
        { label: "A full Saturday is doable if I know the plan.", tags: ["day"] },
        { label: "I can do an overnight if gear and a ride are included.", tags: ["overnight"] },
        { label: "I want the calmest possible first step.", tags: ["calm", "short"] }
      ]
    },
    {
      prompt: "Which setting sounds most like you?",
      options: [
        { label: "A trail and a view. Keep the adrenaline optional.", tags: ["hike"] },
        { label: "Mud, headlamps, and a good story underground.", tags: ["cave"] },
        { label: "A bike and some dirt.", tags: ["bike"] },
        { label: "A boat. I can swim 25 to 50 yards and tread water.", tags: ["boat"] },
        { label: "Heights are fine. I want to try outdoor rock.", tags: ["climb"] }
      ]
    },
    {
      prompt: "What do you want this trip to do for you?",
      options: [
        { label: "Lower the volume of the week and meet a few people.", tags: ["reset"] },
        { label: "Move hard enough that my brain has to take a break.", tags: ["effort"] },
        { label: "Learn a skill I could repeat on my own later.", tags: ["skill"] },
        { label: "Prove to myself that outdoorsy does not have to mean expert.", tags: ["beginner"] }
      ]
    }
  ];

  const results = {
    calm: {
      title: "Start with Mindfulness Outdoors or a short hike",
      text: "You do not need a rapid or a rope. Mindfulness Outdoors pairs an easy time outside with things like a walk, meditation, or painting, and it is built for students without adventure experience. A backpacking day hike is the next step if you want a little more trail. Both are a practical way to bank time outside during a heavy week."
    },
    hike: {
      title: "Start with a beginner backpacking day hike",
      text: "Day hikes are one of the lowest-friction trips we run. Instruction, transportation, and any specialty gear are included, and most students do not need prior backpacking experience. If the day goes well, an overnight is the same sport with a tent and a longer reset."
    },
    cave: {
      title: "Start with a horizontal caving trip",
      text: "Horizontal caving is scrambling, crawling, and walking through passages in the Tennessee–Alabama–Georgia cave country. It is memorable without the rope work of a vertical trip. We provide helmets, lights, and the rest of the specialty kit. Vertical caving comes after you have done a horizontal trip."
    },
    bike: {
      title: "Start with a beginner mountain biking day trip",
      text: "Day rides are generally beginner friendly, with climbs and about ten miles as a typical range. Bikes and the rest of the trip support come with registration. If you already ride, ask the trip leader whether a given date is a better match for your fitness."
    },
    boat: {
      title: "Start on flat water, then decide about whitewater",
      text: "If you can pass the pool swim test — 25 to 50 yards and one minute of treading water, without a life jacket — paddling is open to you. Stand-up paddleboarding and sea kayaking are the calmer first boats. Whitewater kayaking begins in the pool and on class II water, with a required pre-trip class. Intermediate rivers require a beginner trip first."
    },
    climb: {
      title: "Start with a beginner top-rope climbing trip",
      text: "Outdoor climbing trips are small, often about five participants, so you get time on the rock and direct coaching. No gym background is required for beginner top-rope. Lead climbing is an intermediate step after that. You can also use the CRC climbing wall during the week to get comfortable with height before you leave campus."
    },
    overnight: {
      title: "Look at a beginner overnight",
      text: "Overnights cost more than day trips because they cover campsites, more staff time, and a longer window outside — which is exactly the point if your week never leaves you two quiet hours. Backpacking overnights are the usual first overnight. Food is still yours to bring. Registration opens about a month before departure and trips fill quickly."
    }
  };

  let step = 0;
  const scores = {};
  const prompt = quiz.querySelector("[data-prompt]");
  const choices = quiz.querySelector("[data-choices]");
  const progress = quiz.querySelector("[data-progress]");
  const result = quiz.querySelector("[data-result]");

  function addTags(tags) {
    tags.forEach(function (tag) {
      scores[tag] = (scores[tag] || 0) + 1;
    });
  }

  function render() {
    const question = questions[step];
    prompt.textContent = question.prompt;
    progress.style.width = ((step) / questions.length * 100) + "%";
    choices.innerHTML = "";
    question.options.forEach(function (option) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.addEventListener("click", function () {
        addTags(option.tags);
        step += 1;
        if (step < questions.length) render();
        else finish();
      });
      choices.appendChild(button);
    });
  }

  function finish() {
    progress.style.width = "100%";
    const order = ["calm", "cave", "bike", "boat", "climb", "overnight", "hike"];
    let best = "hike";
    let bestScore = -1;
    order.forEach(function (key) {
      const value = scores[key] || 0;
      if (value > bestScore) {
        best = key;
        bestScore = value;
      }
    });
    if ((scores.calm || 0) >= 2) best = "calm";
    const pick = results[best];
    quiz.querySelector("[data-question]").hidden = true;
    result.hidden = false;
    result.innerHTML = "<h3>" + pick.title + "</h3><p>" + pick.text + "</p><p><a class=\"btn btn-primary\" href=\"https://crc.gatech.edu/adventure-trips/\">See current trips</a></p>";
  }

  const restart = quiz.querySelector("[data-restart]");
  if (restart) {
    restart.addEventListener("click", function () {
      step = 0;
      Object.keys(scores).forEach(function (key) { delete scores[key]; });
      result.hidden = true;
      quiz.querySelector("[data-question]").hidden = false;
      render();
    });
  }
  render();
})();
