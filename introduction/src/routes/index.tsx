import { component$, useStore, useResource$, Resource } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const github = useStore({ org: "BuilderIO" });

  const repoResource = useResource$<string[]>(({ track, cleanup }) => {
    track(() => github.org);
    const controller = new AbortController();
    cleanup(() => controller.abort());

    return getRepositories(github.org, controller);
  });

  console.log(github);
  return (
    <main>
      <p>
        <label>
          GitHub organization:
          <input
            value={github.org}
            onInput$={(_, el) => (github.org = el.value)}
          />
        </label>
      </p>
      <section>
        <Resource
          value={repoResource}
          onPending={() => <div>loading...</div>}
          onRejected={(reason) => <div>Error: {reason.message}</div>}
          onResolved={(repos) => (
            <ul>
              {repos.map((repo) => (
                <li>
                  <a href={`https://github.com/${github.org}/${repo}`}>
                    {github.org}/{repo}
                  </a>
                </li>
              ))}
            </ul>
          )}
        />
      </section>
    </main>
  );
});

export async function getRepositories(
  username: string,
  controller?: AbortController
): Promise<string[]> {
  console.log("FETCH", `https://api.github.com/users/${username}/repos`);
  const resp = await fetch(`https://api.github.com/users/${username}/repos`, {
    signal: controller?.signal,
  });
  console.log("FETCH resolved");
  const json = await resp.json();
  return Array.isArray(json)
    ? json.map((repo: { name: string }) => repo.name)
    : Promise.reject(json);
}

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
