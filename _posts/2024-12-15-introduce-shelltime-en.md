# ShellTime.xyz: The Command Line Tracking Service You Need

Have you ever wondered how many commands you've typed in your terminal? How many times you've run `npm`? What commands you used last week? Or if there’s room for improvement?

ShellTime.xyz is here!

By injecting hooks into your shell, ShellTime.xyz records and collects your command history. You can easily review your recent commands on our website, analyze your productivity patterns, and dive into comprehensive statistics.

## Weekly Report

Every Monday, we’ll send you a report summarizing your activity from the past week, including your most-used commands, peak productivity times, supported devices, most frequently used shells, and more.

Of course, we’ll continue adding new reports and insights in the future.

## Multi-Device Support

If you’re like me, managing multiple devices—say, two Macs and ten servers—it’s easy to lose track of what was done on each machine. With ShellTime.xyz, you can quickly view what you’ve done on any specific device over time.

## Privacy

We understand that command execution is private, especially when it involves sensitive data like cookies or authorization tokens in `curl` commands. Don’t worry—ShellTime.xyz anonymizes your data on the client side before sending it to the server. Your sensitive information never leaves your machine.

If you’re still concerned or have better ideas for data masking, feel free to review our code or submit a pull request:

[View Code on GitHub](https://github.com/malamtime/cli/blob/188619d610a1d29939f42d88700ef9a170f159a3/model/string.go#L9)

## Leaderboard

For those who love competition, we have a “Leaderboard” section updated daily. It shows the top command users over the past 30 days.

## Simplified Accounts

Tired of remembering countless usernames and passwords or dealing with endless two-factor authentication? ShellTime.xyz keeps it simple—just log in with your GitHub account, obtain an openToken, and integrate it into your local machine. Smooth and hassle-free!

## Third-Party BI Support

If you find our aggregated statistics insufficient, no problem—we support data export!

Click the export button on the command history page, and we’ll email you a downloadable file once the export is complete. You can then import it into your preferred BI system for in-depth analysis.

For enterprise-level solutions or high-performance analytics databases, feel free to contact us. 😁

## Internationalization

Yes, we know you may not enjoy reading everything in Chinese. That’s why we also support Korean, Japanese, and, of course, English. English is the default language during development.

Don’t worry; there’s always a chance to pay later. 🐶

## Free Plan That Works

We offer advanced features like data export, monthly and annual reports (in development), and more, as part of our paid Pioneer plan. However, to keep the service running, we charge a subscription fee.

Still, our free plan is generous—you can review recent commands, receive weekly reports, and access basic data analysis. If you’re interested in richer features, the Pioneer plan is available for $12/month.

## Paid Features

For paid users, we provide:

1. **Data Export**: Download your data in CSV format for further analysis with BI tools.
2. **Webhooks**: Subscribe to your data and develop custom workflows like data migration or personalized notifications.

## Getting Started

Excited to try it out? Let’s walk you through the basics of setting it up on your computer, Mac, or server.

We use shell hooks to record commands, so your shell must support script hooks. Since `bash` lacks robust support, we currently support `zsh` and `fish`.

After injecting the script into your shell initialization file, you’ll need to `source` it to load the script.

You’ll also need to log in to the ShellTime.xyz website to obtain an openToken for authentication.

Here’s how to install:

```bash
curl -sSL https://raw.githubusercontent.com/malamtime/installation/master/install.bash | bash

source ~/.zshrc  # for zsh
source ~/.config/fish/config.fish  # for fish

shelltime init
```

## FAQ

### Why is the download script stuck?

If you’re in mainland China, the script may not execute because the binaries are hosted on GitHub.

If the GFW blocks access to ShellTime.xyz in the future, you may need additional steps to bypass it.

### Why aren’t my commands showing up immediately?

The client syncs your first command immediately. After that, to reduce network usage and server load, data is aggregated and uploaded in batches (default: every 10 commands).

If your commands don’t show up, try typing a few more. If the issue persists, contact us and provide logs located at `~/.shelltime/log.log`.

### Why Does It Feel a Bit Slow After Using?

The "slowness" can be caused by two factors: local storage and network synchronization.

- **Local storage** performance is quite good. For example, on a 14-inch MacBook Pro with 1TB storage and an M1 Pro chip, local storage operations are completed consistently within 8ms. In everyday use, this difference is barely noticeable.
- **Network synchronization** performance depends on the user’s location and their internet service provider. Under a Singapore-based network, most network sync operations complete within 120ms. However, if your location is farther away, such as in New York, you may experience higher network latency.

If the connection to [ShellTime.xyz](http://shelltime.xyz/) feels slow, you can try modifying the `FlushCount` field in your local configuration file (`~/.shelltime/config.toml`) to a larger value. This reduces the frequency of network syncs. You can then manually trigger updates by running `shelltime sync` at an appropriate time.

## How to Uninstall

If you want to stop using ShellTime.xyz, here’s how to uninstall it cleanly:

1. Remove the ShellTime directory:

```bash
rm -rf ~/.shelltime
```

2. Edit your shell configuration file (e.g., `~/.zshrc` or `~/.config/fish/config.fish`) and remove any lines referencing ShellTime. They may look like this:

```bash
# .zshrc
export PATH="$HOME/.shelltime/bin:$PATH"
source ~/.shelltime/hooks/zsh.zsh
# .config/fish/config.fish
set -gx PATH $HOME/.shelltime/bin $PATH
source ~/.shelltime/hooks/fish.fish
```


If you have any questions, feel free to contact us: [annatar.he+shelltime.xyz@gmail.com](mailto:annatar.he+shelltime.xyz@gmail.com).

Enjoy using ShellTime!
