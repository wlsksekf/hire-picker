import { Header } from "@/components/careers/Header";
import { SearchSection } from "@/components/careers/SearchSection";
import { JobFilters } from "@/components/careers/JobFilters";
import { JobListings } from "@/components/careers/JobListings";
import { Box, Container, Grid } from "@mui/material";

export default function CareersPage() {
  return (
    <Box>
      <Header />
      <main>
        <SearchSection />
        <Container sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} lg={3}>
              <JobFilters />
            </Grid>
            <Grid item xs={12} md={8} lg={9}>
              <JobListings />
            </Grid>
          </Grid>
        </Container>
      </main>
    </Box>
  );
}