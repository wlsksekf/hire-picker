import { Header } from "@/components/jobs/Header";
import { SearchSection } from "@/components/jobs/SearchSection";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobListings } from "@/components/jobs/JobListings";
import { Box, Container, Grid } from "@mui/material";

export default function JobsPage() {
  return (
    <Box>
      <Header />
      <main>
        <SearchSection />
        <Container sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={4} justifyContent="center">
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