async function test() {
  try {
    const url = "http://httpbin.org/redirect-to?url=https%3A%2F%2Fexample.com&status_code=302";
    console.log("Fetching", url);
    const res = await fetch(url, { redirect: "manual" });
    console.log("Status:", res.status);
    console.log("Location header:", res.headers.get("location"));
    console.log("Type:", res.type);
  } catch (err) {
    console.error("Error", err);
  }
}
test();
