import { ProvidersResolver } from "@/modules/providers/providers-resolver";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppHeader } from "@/modules/ui/app-header";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";

const EditProviderPage: NextPage = () => {
  const { push, query } = useRouter();
  const configId = query["configId"] as string;

  const { data, isLoading, isFetched } = trpcClient.providersConfigs.getOne.useQuery(
    {
      id: configId,
    },
    {
      enabled: !!configId,
    }
  );

  const provider = useMemo(() => {
    return data ? ProvidersResolver.createProviderMeta(data.type) : null;
  }, [data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isFetched && !data) {
    push("/404");

    return null;
  }

  if (!provider) {
    return null;
  }

  const EditForm = ProvidersResolver.getEditProviderFormComponent(provider.type);

  return (
    <Box>
      <AppHeader
        text={`Edit connected provider`}
        breadcrumbs={[
          <Breadcrumbs.Item key="editprovider">Edit Provider</Breadcrumbs.Item>,
          <Breadcrumbs.Item key="displayname">{provider?.displayName}</Breadcrumbs.Item>,
          <Breadcrumbs.Item key="configname">{data?.configName}</Breadcrumbs.Item>,
        ]}
      />
      <AppSection
        heading="Edit CMS configuration"
        mainContent={<EditForm configId={configId} />}
        sideContent={
          <Box>{provider.formSideInfo && <Box marginTop={6}>{provider.formSideInfo}</Box>}</Box>
        }
      />
    </Box>
  );
};

export default EditProviderPage;
