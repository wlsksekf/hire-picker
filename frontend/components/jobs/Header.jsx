'use client';
import { AppBar, Toolbar, Typography, Button, Stack, Container } from '@mui/material';

export function Header() {
  return (
    <AppBar position="sticky" color="background" elevation={1}>
      <Container>
        <Toolbar disableGutters>
          <Typography
            variant="h2"
            component="a"
            href="/"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            JobSearch
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button href="#" color="inherit">Jobs</Button>
            <Button href="#" color="inherit">Companies</Button>
            <Button href="#" color="inherit">About</Button>
            <Button href="#" variant="contained" color="primary">
              로그인
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}