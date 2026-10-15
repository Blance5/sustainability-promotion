(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
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
      text: "Mindfulness Outdoors is a walk, meditation, or making something, built for students without adventure experience. A backpacking day hike is the next step if you want more trail."
    },
    hike: {
      title: "Start with a beginner backpacking day hike",
      text: "Instruction, transportation, and specialty gear are included. Most students need no prior experience. An overnight is the same sport with a tent if the day goes well."
    },
    cave: {
      title: "Start with a horizontal caving trip",
      text: "Horizontal caving is scrambling and crawling in Tennessee–Alabama–Georgia cave country. We provide helmets and lights. Vertical trips, which add ropes, come after a horizontal trip."
    },
    bike: {
      title: "Start with a beginner mountain biking day trip",
      text: "Day rides are generally beginner friendly, often around ten miles with some climbs. Bikes come with the trip."
    },
    boat: {
      title: "Start on flat water, then decide about whitewater",
      text: "Pass the pool swim test first: 25 to 50 yards and one minute treading water, no life jacket. Start with paddleboarding or sea kayaking. Whitewater begins in the pool and on class II water."
    },
    climb: {
      title: "Start with a beginner top-rope climbing trip",
      text: "Beginner top-rope trips are small, often about five people, and no gym background is required. The CRC climbing wall is there if you want to practice height during the week."
    },
    overnight: {
      title: "Look at a beginner overnight",
      text: "A beginner backpacking overnight is the usual first night out. You still bring food. Registration opens about a month ahead and fills quickly."
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
