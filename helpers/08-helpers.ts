// helpers
export const client = {
  api: {
    v0: {
      shapes: {
        ':projectId': {
          $get: async (input: { param: { projectId: string } }) => ({
            json: async () => ({ shape: ['square', 'page'] }),
            ok: Math.random() > 0.5,
          }),
        },
      },
    },
  },
};
